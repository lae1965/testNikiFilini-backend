import { OrdersResponse } from './../graphql'
import { Injectable } from '@nestjs/common'
import { CrmType, Order, OrdersFilter, RetailPagination } from './types'
import axios, { AxiosInstance, AxiosResponse } from 'axios'
import { ConcurrencyManager } from 'axios-concurrency'
import { serialize } from '../tools'
import { plainToClass } from 'class-transformer'

@Injectable()
export class RetailService {
  private readonly axios: AxiosInstance

  constructor() {
    this.axios = axios.create({
      baseURL: `${process.env.RETAIL_URL}/api/v5`,
      timeout: 10000,
      headers: { },
    })

    this.axios.interceptors.request.use((config) => {
      const url = config.url
      if (url[url.length - 1] !== '?') config.url += '&'
      config.url += `apiKey=${process.env.RETAIL_KEY}`
      console.log(config.url)
      return config
    })
    this.axios.interceptors.response.use(
      (r) => {
        // console.log("Result:", r.data)
        return r
      },
      (r) => {
        // console.log("Error:", r.response.data)
        return r
      },
    )
  }

  private async requestCRM(filter?: OrdersFilter): Promise<AxiosResponse<any>> {
    const params = serialize(filter, '')
    const resp = await this.axios.get('/orders?' + params)
    
    if (!resp.data) {
      throw new Error('RETAIL CRM ERROR')
    }
    return resp
  }

  async orders(page: number): Promise<OrdersResponse> {
    try {
      const resp = await this.requestCRM({ page })

      const orders = plainToClass(Order, resp.data.orders as Array<any>)
      const pagination: RetailPagination = resp.data.pagination
      
      return { orders, pagination }
    } catch (e) {
      throw e
    }
  }

  async findOrder(id: number): Promise<Order | null> {
    try {
      const resp = await this.requestCRM({ filter: { ids: [id] } })
      return plainToClass(Order, resp.data.orders[0])
    } catch (e) {
      throw e
    }
  }

 /* async orderStatuses(): Promise<CrmType[]> {

  }

  async productStatuses():  Promise<CrmType[]> {

  }

  async deliveryTypes():  Promise<CrmType[]> {

  } */
}
