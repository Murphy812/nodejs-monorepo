import { HandlerContext } from '@loopback/rest/dist/types';
import { HttpError } from 'http-errors';
import { inject } from '@loopback/core';
import { LoggerService } from './logger.service';
import { RejectProvider } from '@loopback/rest';

// For whatever reason Loopback 4 is bad at propagating its own errors:
// it rewraps them into message field, so propagated error could look like this:
// {"statusCode":400,"message":"{\"error\":{\"statusCode\":400,\"name\":\"BadRequestError\",\"message\":\"Reason bla bla bla\"}}"}
// Here we unwrap error.message if possible.
export class CustomRejectProvider extends RejectProvider {
  constructor(@inject('services.LoggerService') private logger: LoggerService) {
    super((err, statusCode, request) => {
      this.logger.info(`Returning non-OK http status: ${err.message}, status = ${statusCode}`, { err, request });
    });
  }

  action({ request, response }: HandlerContext, error: Error) {
    const err = <HttpError>error;

    try {
      error = <HttpError>JSON.parse(err.message).error ?? error;
    } catch (e) {
      // This is fine, probably error was returned by non-Loopback service, so let's keep current error value
    }

    this.logger.error(error.message, error);
    super.action({ request, response }, error);
  }
}
