import fetch from 'node-fetch'

const MAX_PAGINATION_FETCHES = 99

export const fetchAllRows = async (
  rpc,
  options,
  indexName = 'id'
) => {
  const mergedOptions = {
    json: true,
    lower_bound: 0,
    upper_bound: undefined,
    limit: 9999,
    ...options,
  }

  const bigNumberFix = options.bigNumberFix ?? false

  if (bigNumberFix) {
    delete mergedOptions.bigNumberFix
  }

  let rows = []
  let lowerBound = mergedOptions.lower_bound

  for (let i = 0; i < MAX_PAGINATION_FETCHES; i += 1) {
    let result

    if (bigNumberFix) {
      const response = await fetch((rpc.endpoint ?? rpc.currentEndpoint) + '/v1/chain/get_table_rows', {
        method: 'POST',
        body: JSON.stringify({
          ...mergedOptions,
          lower_bound: lowerBound,
        }),
        headers: {
          'Content-type': 'application/json; charset=UTF-8',
        },
      })

      result = JSON.parse(
        (await response.text()).replace(/:(-?\d+),/g, ': "$1",')
      )

    } else {
      result = await rpc.get_table_rows({
        ...mergedOptions,
        lower_bound: lowerBound,
      })
    }

    rows = rows.concat(result.rows)


    if (!result.more || result.rows.length === 0 || rows.length >= mergedOptions.limit) break

    // EOS 2.0 api
    // TODO Add 'more' key
    if (typeof result.next_key !== 'undefined') {
      lowerBound = result.next_key
    } else {
      lowerBound =
        Number.parseInt(
          `${result.rows[result.rows.length - 1][indexName]}`,
          10
        ) + 1
    }
  }

  return rows
}
