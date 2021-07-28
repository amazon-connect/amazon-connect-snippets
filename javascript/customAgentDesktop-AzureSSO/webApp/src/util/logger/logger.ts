import { Amplify, Logger as AmplifyLogger } from 'aws-amplify'; //npm install aws-amplify

class Logger {
  private static _instance: Logger;

  private _amplifyLogger!: AmplifyLogger;

  private constructor() {
    Amplify.Logger.LOG_LEVEL = 'DEBUG';
    this._amplifyLogger = new AmplifyLogger('');
  }

  public static getInstance(): Logger {
    if (!Logger._instance) {
      Logger._instance = new Logger();
    }

    return Logger._instance;
  }

  public getLogger(): AmplifyLogger {
    return this._amplifyLogger;
  }
}

export default Logger;