---
title: "00-Integration spec: Overview"
---

Our goal is to let you integrate products easily to Deploy App. 

### Integration Specs:


1. **Compose integration** - (as for now) make your backend to deploy with Deploy App
2. **Backend integration** - provide /healthcheck for health and make Deploy App users be able to auth to your product
3. **UI integration** - provide /instructions or content to be shown in Deploy App UI (buttons etc)
4. FUTURE: **K8s integration** - define a helmchart that can be spun up with Deploy App, to provide an integration that can be deployed on will

### Reference implementation:

The Fake Product integration API:

* Reference compose integration: rmfpapi setup at [https://github.com/pvarki/docker-rasenmaeher-integration](https://github.com/pvarki/docker-rasenmaeher-integration) 
* Reference integration API [https://github.com/pvarki/python-rasenmaeher-rmfpap](https://github.com/pvarki/python-rasenmaeher-rmfpapi)i
* Reference ui content [https://github.com/pvarki/rune-fake-metadata](https://github.com/pvarki/rune-fake-metadata)


\
