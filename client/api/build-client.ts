import axios from 'axios';
import { IncomingMessage } from 'http';

const INGRESS_SERVICE =
  'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local';

const buildClient = (req: IncomingMessage) => {
  if (typeof window === 'undefined') {
    // On server
    return axios.create({
      baseURL: INGRESS_SERVICE,
      headers: req.headers,
    });
  } else {
    // On client
    return axios.create({
      baseURL: '/',
      headers: req.headers,
    });
  }
};

export default buildClient;
