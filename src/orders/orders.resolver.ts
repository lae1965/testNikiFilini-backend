import { Args, Query, Resolver } from '@nestjs/graphql'
import { RetailService } from '../retail_api/retail.service'
import { OrdersResponse } from '../graphql'

@Resolver('Orders')
export class OrdersResolver {
  constructor(private retailService: RetailService) {}

  @Query()
  async getOrders(@Args('page') page: number): Promise<OrdersResponse> {
    const retcode = await this.retailService.orders(page)
    return retcode
  }
   
  @Query()
  async order(@Args('number') id: string) {
    return this.retailService.findOrder(+id)
  } 
}
