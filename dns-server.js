const dns = require('dns2')
const { Packet } = dns

module.exports = async function createServer (entries) {
  const onRequest = (request, send) => {
    const response = Packet.createResponseFromRequest(request)
    // Note: common public DNS servers only support single requests
    const [question] = request.questions
    const { name, type, class: clazz } = question
    let answers = entries[name] && entries[name][type]
    if (answers) {
      if (!Array.isArray(answers)) {
        answers = [answers]
      }
      response.answers = answers.map((data) => {
        return {
          name,
          type,
          class: clazz || Packet.CLASS.IN,
          ttl: 300,
          ...data
        }
      })
    }
    send(response)
  }
  const [udp, tcp, doh] = await Promise.all([
    createUDPServer('udp4'),
    createTCPServer(),
    createDohServer()
  ])
  udp.server.on('request', onRequest)
  tcp.server.on('request', onRequest)
  doh.server.on('request', onRequest)
  return { udp, tcp, doh, close }

  async function close () {
    await Promise.all([
      new Promise((resolve) => tcp.server.close(resolve)),
      new Promise((resolve) => udp.server.close(resolve)),
      new Promise((resolve) => doh.server.server.close(resolve))
    ])
  }
}

async function createUDPServer (type) {
  const server = dns.createUDPServer({ type })
  await server.listen()
  return { server, address: server.address() }
}

async function createTCPServer () {
  const server = dns.createTCPServer()
  await server.listen(0)
  return { server, address: server.address() }
}

function createDohServer () {
  return new Promise((resolve, reject) => {
    const server = dns.createDOHServer()
    const close = () => {
      server.off('listening', finish)
      server.off('error', error)
    }
    const finish = (address) => {
      close()
      resolve({ server, address })
    }
    const error = (error) => {
      close()
      reject(error)
    }
    server.once('listening', finish)
    server.once('error', error)
    server.listen(0)
  })
}
