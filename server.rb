require 'sinatra'
require 'rack'
require 'net/http'
require 'json'

class Server < Sinatra::Base
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
  
  get '/arrivals-and-departures-for-stop/:stopid' do
    url = URI::HTTP.build(
      host: 'api.pugetsound.onebusaway.org', 
      path: "/api/where/arrivals-and-departures-for-stop/#{params['stopid']}.json",
      query: Rack::Utils.build_query(
        key: 'TEST',
        minutesBefore: 5,
        minutesAfter: 45
      )
    )
    puts("Getting #{url}")
    response = Net::HTTP.get(url)
  
    content_type :json
    response
  end

  run! if app_file == $0
end
