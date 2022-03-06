/**
* Simple Data Object representing website metadata
* @remarks
* Used by elastic search and page_metadata plugins
*/
class Meta {
    public url: string;
    public title: string;
    public description: string;
    public image: string;
    public icon: string;
    public updatedAt: Date;
}

export default Meta ;