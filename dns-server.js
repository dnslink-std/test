const dns = require('dns2')
const { Packet } = dns

module.exports = async function createServer (entries) {
  const lookup = {}
  for (const domain in entries) {
    lookup[toCharCodes(domain)] = entries[domain]
  }
  const server = dns.createServer({
    udp: true,
    tcp: true,
    doh: true,
    handle: (request, send) => {
      const response = Packet.createResponseFromRequest(request)
      // Note: common public DNS servers only support single requests
      const [question] = request.questions
      const { name, type, class: clazz } = question
      let answers = lookup[name] && lookup[name][type]
      if (answers) {
        if (!Array.isArray(answers)) {
          answers = [answers]
        }
        response.answers = answers.map((data) => {
          return {
            name,
            type,
            class: clazz || Packet.CLASS.IN,
            ttl: 100,
            ...data
          }
        })
      } else {
        const rcode = lookup[name] && lookup[name].RCODE && lookup[name].RCODE[0] && entries[name].RCODE[0].data
        // In case no answer is given and no error is provided, we use the rcode === 3 aka unknown domain.
        response.header.rcode = rcode || 3
      }
      send(response)
    }
  })
  await server.listen()
  return server
}

function toCharCodes (testDomain) {
  const buff = Buffer.from(testDomain)
  let string = ''
  for (const i of buff) {
    string += String.fromCharCode(i)
  }
  return string
}
