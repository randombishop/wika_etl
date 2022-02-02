import fetch from 'node-fetch';


export class PluginEmails {

    private _isEnabled: number;
    private host: string;
    private fromEmail: string ;
    private toEmail: string ;
    private apiKey: string ;

    constructor() {
        this._isEnabled = parseInt(process.env.EMAIL_ALERT_ENABLE) ;
        if (this._isEnabled==1) {
            this.host = process.env.EMAIL_ALERT_HOST ;
            this.fromEmail = process.env.EMAIL_ALERT_FROM ;
            this.toEmail = process.env.EMAIL_ALERT_TO ;
            this.apiKey = process.env.EMAIL_ALERT_KEY ;
        }
    }

    isEnabled(): boolean {
        return (this._isEnabled==1) ;
    }

    async sendError(errorMessage) {
        const subject = "Wika ETL alert" ;
        const payload = {
            "personalizations": [{"to": [{"email": this.toEmail}]}],
            "from": {"email": this.fromEmail},
            "subject": subject,
            "content": [{"type": "text/plain", "value": errorMessage}]
        } ;
        const config = {
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + this.apiKey
            },
            body: JSON.stringify(payload)
        } ;
        const response = await fetch(this.host, config);
        console.log(response) ;
    }

}




