import mongoose, { model, Schema } from 'mongoose';
import { PasswordService } from '../services/password';

// An interface that describes the properties required to create a new user
interface UserAttrs {
  email: string;
  password: string;
}

// An Interface that describes the properties of a User Model
interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc;
}

// An interface that descrbies the properties of a User Document
interface UserDoc extends mongoose.Document {
  email: string;
  password: string;
}

const userSchema = new Schema(
  {
    email: { type: String, required: true },
    password: { type: String, required: true },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.password;
      },
      versionKey: false,
    },
  }
);

userSchema.pre('save', async function (done) {
  if (this.isModified('password')) {
    const hashed = await PasswordService.toHash(this.get('password'));
    this.set('password', hashed);
  }
  done();
});

userSchema.statics.build = (attrs: UserAttrs) => {
  return new UserModel(attrs);
};

const UserModel = model<UserDoc, UserModel>('User', userSchema);

export { UserModel };
