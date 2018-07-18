require 'erb'
require 'jasmine'
require 'rake'
require 'fileutils'
require 'tempfile'

load 'jasmine/tasks/jasmine.rake'
ENV['JASMINE_CONFIG_PATH'] = 'tests/jasmine.yml'

TARGET_DIRECTORY = 'public'
INTERMEDIATE_DIRECTORY = 'build'

def concat(dest, sources)
  for file in sources
    dest.write(File.read(file))
  end
end

def build_app_html
  maps_key = ENV['WB_MAPS_API_KEY']
  templates = File.read('src/templates.html')
  erb = ERB.new(File.read('src/index.html.erb'))
  html = erb.result(binding)
  File.write("#{TARGET_DIRECTORY}/index.html", html)
end

def build_version_file
  version = `git show --oneline --quiet HEAD`
  changes = `git status --porcelain | grep -v '^$'`

  if changes == ""
    File.write("#{TARGET_DIRECTORY}/version.txt", version)
  else
    File.write("#{TARGET_DIRECTORY}/version.txt", "#{version}(dirty)\n")
  end
end

def concat_js(dest)
  special = ['src/prefix.js', 'src/Controller.js']
  all_js = Dir.glob('src/*.js')
  ordinary = all_js.reject {|f| special.include?(f) }
  concat(dest, special + ordinary)
end
 
task :default => [:build, :unitTests]

task :unitTests => "jasmine:ci"

task :build, [:environment] => :clean do |t, args|
  buildenv = args[:environment]

  if buildenv.nil?
    buildenv = 'acceptance'
  end

  mkdir_p(TARGET_DIRECTORY)
  mkdir_p(INTERMEDIATE_DIRECTORY)

  # The source file that we pass to babel must be inside the repo,
  # otherwise babel won't find our .babelrc file.
  js_temp = File.open("#{INTERMEDIATE_DIRECTORY}/wb-es2015.js", "w")
  concat_js(js_temp)
  js_temp.close
  sh('node_modules/.bin/babel', js_temp.path, '--out-file', "#{TARGET_DIRECTORY}/weatherbus.js", '--source-maps')

  FileUtils.cp("src/config-#{buildenv}.js", "#{TARGET_DIRECTORY}/config.js")
  build_app_html
  build_version_file
  sh "sass --scss src/weatherbus.scss #{TARGET_DIRECTORY}/weatherbus.css"

  sh 'node_modules/.bin/jshint src'
  sh 'cd tests && ../node_modules/.bin/jshint --exclude lib .'
end

task :server do
	sh 'ruby server.rb'
end

task :clean do
  if File.exist?("target")
	  Dir.entries(TARGET_DIRECTORY).each do |f|
	    if f != "." && f != ".."
	      rm_rf("#{TARGET_DIRECTORY}/#{f}")
	    end
	  end
  end
end

task :run_integration do
  require 'json'
  require 'net/http'
  require 'open-uri'

  builds = JSON.load(open('https://api.travis-ci.org/repos/seattle-beach/weatherbus-integration/builds').read)
  build_num = builds.first['id']

  url = "https://api.travis-ci.org/builds/#{build_num}/restart"
  auth = "token #{ENV['AUTH_TOKEN']}"
  sh "curl -X POST #{url} --header \"Authorization: #{auth}\""
end
