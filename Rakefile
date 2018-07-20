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
  maps_key = ENV['MB_MAPS_API_KEY']
  oba_key = ENV['MB_OBA_API_KEY'] || 'TEST'
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

task :build => :clean do |t, args|
  mkdir_p(TARGET_DIRECTORY)
  mkdir_p(INTERMEDIATE_DIRECTORY)

  # The source file that we pass to babel must be inside the repo,
  # otherwise babel won't find our .babelrc file.
  js_temp = File.open("#{INTERMEDIATE_DIRECTORY}/wb-es2015.js", "w")
  concat_js(js_temp)
  js_temp.close
  sh('node_modules/.bin/babel', js_temp.path, '--out-file', "#{TARGET_DIRECTORY}/microbus.js", '--source-maps')

  build_app_html
  build_version_file
  sh "sass --scss src/microbus.scss #{TARGET_DIRECTORY}/microbus.css"

  sh 'node_modules/.bin/jshint src'
  sh 'cd tests && ../node_modules/.bin/jshint --exclude lib .'
end

task :cfdeploy  => [:build, :unitTests] do
	sh 'cf push'
end

task :scpdeploy  => [:build, :unitTests] do
	dest=ENV['MB_SCP_DEST']
	
	if dest.nil?
		raise 'The MB_SCP_DEST environment variable is not set.'
	end

	sh 'cd public && scp * $MB_SCP_DEST'
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
