export interface ICached {
   cacheId(): string;
   readCache(): any;
   putCache(obj: any): Promise<boolean>;
}