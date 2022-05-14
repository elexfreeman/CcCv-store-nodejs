import * as net from 'net';
import * as events from 'events';

class CcCvEmitter extends events.EventEmitter {}

const prepareStringSend = (data: string): string => {
  if (!data) {
    return '';
  }

  return data.replace('|', '\|');
}

const prepareStringRecerve = (data: string): string => {
  if (!data) {
    return '';
  }

  return data.replace('\|', '|');
}

class CcCvDriver {

  private host: string = 'localhost';
  private port: number = 8888;

  private emitter: CcCvEmitter;
  private client: net.Socket;

  private isConnected = false;

  constructor(_host: string, _port: number) {
    this.host = _host;
    this.port = _port;
    this.emitter = new CcCvEmitter();
    this.client = new net.Socket();
  }

  connect() {
    return new Promise((resolve) => {
      this.client.connect(this.port, this.host, () => {
        this.isConnected = true;
        resolve(true);
      });

      this.client.on('data', (data) => {
        this.emitter.emit('event', data);
      });

      this.client.on('close', () => {
        console.log('CCcCvStore connection closed');
      });
    });
  }

  setData(key: string, data: string): Promise<boolean> {
    if (!this.isConnected) {
      return new Promise((resolve, reject) => reject('NOT connected'));
    }
    const msg = `1|${prepareStringSend(key)}|${prepareStringSend(data)}`;
    console.log(msg);
    this.client.write(msg);
    return new Promise((resolve) => {
      const event = (binData: any) => {
        const data = binData.toString();
        // example 2|mykey|mydata
        const aData = data.split('|');
        if (aData.length > 1) {
          if ((aData[0] == '1') && (prepareStringRecerve(aData[1]) == key)) {
            this.emitter.removeListener('event', event);
            resolve(true);
          }
        }
      }
      this.emitter.on('event', event)
    });
  }

  removeData(key: string): Promise<string> {
    if (!this.isConnected) {
      return new Promise((resolve, reject) => reject('NOT connected'));
    }
    this.client.write(`3|${prepareStringSend(key)}`);
    return new Promise((resolve) => {
      const event = (binData: any) => {
        const data = binData.toString();
        // example 3|mykey|
        const aData = data.split('|');
        if (aData.length > 1) {
          if ((aData[0] == '3') && (prepareStringRecerve(aData[1]) == key)) {
            this.emitter.removeListener('event', event);
            resolve(prepareStringRecerve(aData[2]));
          }
        }
      }
      this.emitter.on('event', event);
    });
  }

  getData(key: string): Promise<string> {
    if (!this.isConnected) {
      return new Promise((resolve, reject) => reject('NOT connected'));
    }
    return new Promise((resolve) => {
      this.client.write(`2|${prepareStringSend(key)}|`);

      const event = (binData: any) => {
        const data = binData.toString();
        // example 2|mykey|mydata
        const aData = prepareStringRecerve(data).split('|');
        console.log('aData', data);
        if (aData.length > 1) {
          if ((aData[0] == '2') && (aData[1] == key)) {
            this.emitter.removeListener('event', event);
            resolve(prepareStringRecerve(aData[2]));
          }
        }
      }
      this.emitter.on('event', event);
    });
  }

}


export default CcCvDriver;
