import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Environment } from '../../../../shared/UI/environment/env';

@Injectable({
  providedIn: 'root',
})
export class JopService {

  private readonly _HttpClient = inject(HttpClient);


  addrequirements(data: any) {
    return this._HttpClient.post(`${Environment.baseUrl}/api/recruitment/add`, data);
  }
}
