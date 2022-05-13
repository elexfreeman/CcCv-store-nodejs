import * as net from 'net';
import * as events from 'events';

class CcCvEmitter extends events.EventEmitter {}

class CcCvDriver {

  private host: string = 'localhost';
  private port: number = 8888;

  private emitter: CcCvEmitter;
  private client: net.Socket;

  constructor(_host: string, _port: number) {
    this.host = _host;
    this.port = _port;
    this.emitter = new CcCvEmitter();
    this.client = new net.Socket();
  }

  connect() {
    return new Promise((resolve) => {
      this.client.connect(this.port, this.host, () => {
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
    const d = `1|${key}|${data}`
    this.client.write(d);
    return new Promise((resolve) => {
      this.emitter.on('event', (binData) => {
        const data = binData.toString();
        // example 2|mykey|mydata
        let aData = data.split('|');
        if ((aData[0] == '1') && (aData[1] == key)) {
          resolve(true);
        }
      })
    });
  }


  removeData(key: string): Promise<string> {
    this.client.write(`3|${key}`);
    return new Promise((resolve) => {
      this.emitter.on('event', (binData) => {
        let data = binData.toString();
        // example 3|mykey|
        let aData = data.split('|');
        if ((aData[0] == '3') && (aData[1] == key)) {
          resolve(aData[2]);
        }
      })
    });
  }

  getData(key: string): Promise<string> {
    return new Promise((resolve) => {
      this.emitter.on('event', (binData) => {
        let data = binData.toString();
        // example 2|mykey|mydata
        let aData = data.split('|');
        if ((aData[0] == '2') && (aData[1] == key)) {
          resolve(aData[2]);
        }
      })
    });
  }

}


export default CcCvDriver;
