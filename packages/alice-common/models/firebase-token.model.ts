import { model } from '@loopback/repository';
import { Column, Entity, PrimaryColumn } from 'typeorm';
import { NumberProperty, StringProperty } from '@alice/alice-common/models/alice-model-engine';

@model()
@Entity({
  name: 'firebase_tokens',
})
export class FirebaseToken {
  @NumberProperty() @PrimaryColumn() id: number;

  @StringProperty() @Column() token: string;
}
