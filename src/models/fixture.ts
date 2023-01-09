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
import { FixtureStatus } from './fixture-status';
import { MatchResult } from './match-result';
/**
 * Fixture object
 * @export
 * @interface Fixture
 */
export interface Fixture {
    /**
     * Fixture unique identifier
     * @type {string}
     * @memberof Fixture
     */
    id: string;
    /**
     * Home Team name
     * @type {string}
     * @memberof Fixture
     */
    homeTeam: string;
    /**
     * Away Team nam
     * @type {string}
     * @memberof Fixture
     */
    awayTeam: string;
    /**
     * Date & Time that match starts
     * @type {Date}
     * @memberof Fixture
     */
    commencesAt: Date;
    /**
     * 
     * @type {FixtureStatus}
     * @memberof Fixture
     */
    status: FixtureStatus;
    /**
     * 
     * @type {MatchResult}
     * @memberof Fixture
     */
    matchResult?: MatchResult;
    /**
     * 
     * @type {string}
     * @memberof Fixture
     */
    createdBy?: string;
    /**
     * 
     * @type {string}
     * @memberof Fixture
     */
    updatedBy?: string;
    /**
     * 
     * @type {Date}
     * @memberof Fixture
     */
    createdAt?: Date;
    /**
     * 
     * @type {Date}
     * @memberof Fixture
     */
    updatedAt?: Date;
}
