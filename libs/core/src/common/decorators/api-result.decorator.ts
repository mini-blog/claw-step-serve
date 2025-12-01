import { Type, applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
import { ResponseDto } from '../dto/response.dto';

const baseTypes = [Boolean, Number, String] as Type<any>[];

export const ApiResult = <TModel extends Type<any>>(model: TModel) => {
    // 基础类型
    if (baseTypes.includes(model)) {
        return applyDecorators(
            ApiExtraModels(ResponseDto),
            ApiOkResponse({
                schema: {
                    allOf: [
                        { $ref: getSchemaPath(ResponseDto) },
                        {
                            properties: {
                                data: {
                                    type: model.name.toLowerCase(),
                                },
                            },
                        },
                    ],
                },
            }),
        );
    }

    // DTO 对象类型
    // 使用 allOf 组合 ResponseDto 和具体的 data 类型
    // 这样生成的 OpenAPI 文档是真实的，所有客户端都能正确处理
    return applyDecorators(
        ApiExtraModels(ResponseDto, model),
        ApiOkResponse({
            schema: {
                allOf: [
                    { $ref: getSchemaPath(ResponseDto) },
                    {
                        properties: {
                            data: { $ref: getSchemaPath(model) },
                        },
                    },
                ],
            },
        }),
    );
};
