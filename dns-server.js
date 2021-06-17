const dns = require('dns2')
const { Packet } = dns

module.exports = async function createServer (entries) {
  const server = dns.createServer({
    udp: true,
    tcp: true,
    doh: true,
    handle: (request, send) => {
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
  })
  await server.listen()
  return server
}
