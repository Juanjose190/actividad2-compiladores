import { ApiProperty } from '@nestjs/swagger';

export class RespuestaAuthDto {
  @ApiProperty()
  access_token: string;

  @ApiProperty()
  refresh_token: string;

  @ApiProperty({ example: 'Admin' })
  rol: string;
}
