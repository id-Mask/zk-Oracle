module.exports = {
  info: {
    version: 'beta',
    title: 'Id-Mask: zk powered identity',
    description: 'API endpoints for accessing identity and associated data that powers <b><a href="https://idmask.xyz/">id-mask</a></b>',
  },
  baseDir: __dirname + '/../routes',
  swaggerUIPath: '/api-docs',
  exposeSwaggerUI: true,
  exposeApiDocs: true,
  apiDocsPath: '/v3/api-docs',
  notRequiredAsNullable: false,
}