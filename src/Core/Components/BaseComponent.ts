// Base Imports
import React, {Component} from 'react';
import {AsyncStorage} from 'react-native';

// Other Imports
import {ICached} from '../../Core/Contracts/ICached';

export abstract class BaseComponent extends React.Component implements ICached {
  constructor(props) {
    super(props);
  }

  abstract cacheId(): string;

  readCache(): Promise<any> {
    return AsyncStorage.getItem(this.cacheId())
      .then((item: any) => {
        if (item) {
          return JSON.parse(item);
        }
        return null;
      })
      .catch(err => {
        return null;
      });
  }

  putCache(obj: any): Promise<boolean> {
    return AsyncStorage.setItem(this.cacheId(), JSON.stringify(obj))
      .then(() => {
        return true;
      })
      .catch(err => {
        return false;
      });
  }
}
