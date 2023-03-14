import IMCompony from './IMCompony'

const imCompony = new IMCompony(1, 9527)
  .addEventListener('message', (data) => {
    console.log('data: ', data)
  })
  .addEventListener('heartbeat', () => {
    console.log('heartbeat: ')
  })
console.log('imCompony: ', imCompony)
