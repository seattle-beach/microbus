require 'sinatra'
require 'rack'
require 'net/http'
require 'json'

get '/' do
  send_file File.join(settings.public_folder, 'index.html')
end

get '/stops-for-location' do
  url = URI::HTTP.build(
    host: 'api.pugetsound.onebusaway.org', 
    path: '/api/where/stops-for-location.json',
    query: Rack::Utils.build_query(
      key: 'TEST',
      lat: params['lat'],
      lon: params['lng'],
      latSpan: params['latSpan'],
      lonSpan: params['lngSpan']
    )
  )
  response = Net::HTTP.get(url)
  doc = JSON.parse(response)

  content_type :json
  doc['data']['list'].to_json
end

get '/stop/:stopid' do
  url = URI::HTTP.build(
    host: 'api.pugetsound.onebusaway.org', 
    path: "/api/where/stop/#{params['stopid']}.json",
    query: Rack::Utils.build_query(
      key: 'TEST',
    )
  )
  response = Net::HTTP.get(url)
  doc = JSON.parse(response)

  content_type :json
  doc['data'].to_json
end
