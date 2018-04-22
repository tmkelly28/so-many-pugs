const _mem = {}

const _cache = {
  get (url, method) {
    return _mem[url] && _mem[url][method]
  },
  set (url, method) {
    _mem[url] = _mem[url] || {}
    _mem[url][method] = true
  }
}

export const createApiMiddleware = (ajax, history) => {
  return store => next => action => {
    const {
      api,
      method,
      config,
      cache,
      type,
      error,
      success
    } = action

    if (!api) return next(action)

    const cached = _cache.get(api + JSON.stringify(config), method)
    if (cache && cached) {
      return Promise.resolve(cached)
    }

    return ajax[method](api, config)
      .then(res => res.data)
      .then(payload => {
        next({type, payload})
        if (cache) {
          _cache.set(api + JSON.stringify(config), method)
        }
        if (success) {
          success({payload, ajax, history})
        }
      })
      .catch(err => {
        next({type: error, err})
      })
  }
}
