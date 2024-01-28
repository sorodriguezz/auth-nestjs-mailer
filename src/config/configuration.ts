export default () => ({
  port: parseInt(process.env.PORT) | 9000,
  configDb: {
    type: 'postgres',
    host: process.env.PG_CREDENTIALS_HOST,
    username: process.env.PG_CREDENTIALS_USER,
    password: process.env.PG_CREDENTIALS_PASSWORD,
    database: process.env.PG_CREDENTIALS_DATABASE,
    synchronize: true,
    autoLoadEntities: true,
  },
  configJwt: {
    secret: process.env.JWT_SECRET,
    signOptions: {
      expiresIn: process.env.JWT_EXPIRES_IN,
    },
  },
  configMailer: {
    transport: {
      service: process.env.EMAIL_CREDENTIALS_SERVICE,
      secure: false,
      auth: {
        user: process.env.EMAIL_CREDENTIALS_USER,
        pass: process.env.EMAIL_CREDENTIALS_PASSWORD,
      },
    },
    defaults: {
      from: process.env.EMAIL_DEFAULT_FROM,
    },
  },
});
