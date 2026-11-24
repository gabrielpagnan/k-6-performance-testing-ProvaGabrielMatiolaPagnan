import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/latest/dist/bundle.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate } from 'k6/metrics';

// API pública utilizada: JSONPlaceholder (https://jsonplaceholder.typicode.com)
const BASE_URL = 'https://jsonplaceholder.typicode.com';

export const getPostsDuration = new Trend('get_posts_duration', true);
export const getPostByIdDuration = new Trend('get_post_by_id_duration', true);
export const statusOkRate = new Rate('status_ok_rate');

export const options = {
  // Inicia a execução já com 7 VUs (startVUs da rampa)
  vus: 7,

  // Rampa com tempo total de 3,5 minutos (30s + 1m + 1m + 1m = 3m30s)
  stages: [
    { duration: '30s', target: 7 }, // mantém 7 VUs iniciais
    { duration: '1m', target: 50 }, // sobe gradualmente para 50 VUs
    { duration: '1m', target: 92 }, // atinge o máximo de 92 VUs
    { duration: '1m', target: 0 } // desaceleração até 0 VUs
  ],

  thresholds: {
    // 90% das respostas com tempo abaixo de 6800ms
    http_req_duration: ['p(90)<6800'],
    // Menos de 25% das requisições retornando erro
    http_req_failed: ['rate<0.25']
  }
};

export function handleSummary(data) {
  return {
    './src/output/index.html': htmlReport(data),
    stdout: textSummary(data, { indent: ' ', enableColors: true })
  };
}

export default function () {
  const params = {
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const OK = 200;

  // GET /posts - lista de posts
  const resPosts = http.get(`${BASE_URL}/posts`, params);
  getPostsDuration.add(resPosts.timings.duration);
  statusOkRate.add(resPosts.status === OK);

  check(resPosts, {
    'GET /posts - status 200': r => r.status === OK,
    'GET /posts - retorna 100 posts': r => {
      try {
        return r.json().length === 100;
      } catch (e) {
        return false;
      }
    }
  });

  // GET /posts/{id} - post aleatório entre 1 e 100
  const id = Math.floor(Math.random() * 100) + 1;
  const resPost = http.get(`${BASE_URL}/posts/${id}`, params);
  getPostByIdDuration.add(resPost.timings.duration);
  statusOkRate.add(resPost.status === OK);

  check(resPost, {
    'GET /posts/{id} - status 200': r => r.status === OK,
    'GET /posts/{id} - id correto': r => {
      try {
        return r.json().id === id;
      } catch (e) {
        return false;
      }
    }
  });

  sleep(1);
}
