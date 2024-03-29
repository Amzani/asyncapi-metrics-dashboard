import { readFileSync, writeFileSync } from 'fs';

export type CacheData = {
  timestamp: number;
  value: number;
}
export class CacheManager {
  private cacheFilePath: string;
  private data: CacheData[] = [];
  private latestQueriedTimestamp: number =0;
  private THREE_MONTHS_IN_MS = 90 * 24 * 60 * 60 * 1000;

  constructor(fileName: string) {
    this.cacheFilePath = fileName;
  }

  private readCache() {
    try {
      const data = readFileSync(this.cacheFilePath, 'utf8');
      const jsonData = JSON.parse(data);
      this.data = jsonData.data;
      this.latestQueriedTimestamp = jsonData.latestQueriedTimestamp;
    } catch (error) {
      console.error('Error reading cache:', error);
    }
  }

  private writeToFile() {
    try {
     writeFileSync(this.cacheFilePath, JSON.stringify({data: this.data, latestQueriedTimestamp: this.latestQueriedTimestamp}), 'utf8');
    } catch (error) {
      console.error('Error writing cache:', error);
    }
  }

  public updateCache(data: CacheData[]){
    this.data = this.data.concat(data);

    //store the larget timestamp from the data array
    this.latestQueriedTimestamp = Math.max(...data.map(entry => entry.timestamp));
    this.clearOldEntries()
    this.writeToFile()
  }

  public clearOldEntries() {
    const currentTimestamp = Date.now();
    this.data.forEach((entry, index) => {
      const entryTimestamp = entry.timestamp;
      if (currentTimestamp - entryTimestamp > this.THREE_MONTHS_IN_MS) {
        delete this.data[index];
      }
    });
  }

  public getCache(): {data: CacheData[], latestQueriedTimestamp: number} {
    this.readCache();
    return {data: this.data, latestQueriedTimestamp: this.latestQueriedTimestamp};
  }
}

export default CacheManager;
