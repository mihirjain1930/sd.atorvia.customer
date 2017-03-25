import { Meteor } from "meteor/meteor";

declare var ServiceConfiguration:any;

ServiceConfiguration.configurations.remove({
    service: 'facebook'
});
ServiceConfiguration.configurations.insert({
    service: 'facebook',
    appId: '136982903494527',
    secret: 'e746a9ad0ebc8158d150228df23d1e64'
});
