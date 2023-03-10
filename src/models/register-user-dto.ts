/* tslint:disable */
/* eslint-disable */
/**
 * GoMoney Football-League Manager Service
 * This service provides endpoints for all `football-league manager` related interactions
 *
 * OpenAPI spec version: 1.0.0
 * Contact: fatai@mail.com
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */
/**
 * 
 * @export
 * @interface RegisterUserDto
 */
export interface RegisterUserDto {
    /**
     * User's email
     * @type {string}
     * @memberof RegisterUserDto
     */
    email: string;
    /**
     * 
     * @type {string}
     * @memberof RegisterUserDto
     */
    password: string;
    /**
     * Indicates if user should be an admin or just a normal user
     * @type {boolean}
     * @memberof RegisterUserDto
     */
    isAdmin: boolean;
    /**
     * User's first-name
     * @type {string}
     * @memberof RegisterUserDto
     */
    firstName?: string;
    /**
     * User's first-name
     * @type {string}
     * @memberof RegisterUserDto
     */
    lastName?: string;
}
