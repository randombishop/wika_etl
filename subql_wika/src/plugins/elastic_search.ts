import fetch from 'node-fetch';
import crypto from 'crypto';
import Meta from './meta' ;


export class PluginElasticSearch {

    private isEnabled: number;
    private host: string;

    constructor() {
        this.isEnabled = parseInt(process.env.ES_ENABLE) ;
        if (this.isEnabled==1) {
            this.host = process.env.ES_HOST ;
        }
    }

    isSyncEnabled(): boolean {
        return (this.isEnabled==1) ;
    }

    getUrlHash(url: string) {
        return crypto.createHash('md5').update(url).digest('hex');
    }

    async callApiAndGetResult(path, config) {
        const response = await fetch(this.host+path, config);
        const data = await response.json();
        return data.result ;
    }

    async callApiAndGetSource(path, config) {
        const response = await fetch(this.host+path, config);
        const data = await response.json();
        if (data.found) {
            return data._source ;
        } else {
            return null ;
        }
    }


    // URL CRUD FUNCTIONS
    // ------------------

    async getUrl(url: string) {
        const rest_path = '/url/_doc/' + this.getUrlHash(url) ;
        const rest_config = {
            method: 'get',
            headers: {'Content-Type': 'application/json'}
        }
        const doc = await this.callApiAndGetSource(rest_path, rest_config);
        return doc ;
    }

    async postUrl(url: string, data: Meta) {
        const rest_path = '/url/_doc/' + this.getUrlHash(url) ;
        const rest_config = {
        	method: 'post',
	        body: JSON.stringify(data),
	        headers: {'Content-Type': 'application/json'}
        }
        const result = await this.callApiAndGetResult(rest_path, rest_config);
        return result ;
    }

    async deleteUrl(url: string) {
        const rest_path = '/url/_doc/' + this.getUrlHash(url) ;
        const rest_config = {
            method: 'delete',
            headers: {'Content-Type': 'application/json'}
        }
        const result = await this.callApiAndGetResult(rest_path, rest_config);
        return result ;
    }


    // Release Elastic Search Client
    // --------------------------------------

    async dispose(): Promise<void>{

    }



}

