# NOTE: required Compass version.
COMPASS_VERSION = ">= 1.0.3"


begin
	gem "compass", COMPASS_VERSION
rescue ::Gem::LoadError => e
	if COMPASS_VERSION =~ /[a-z]/i
		$stderr.puts "#{e.class}: Could not find compass (#{COMPASS_VERSION}), install it:\n  gem install --pre compass"
	else
		$stderr.puts "#{e.class}: Could not find compass (#{COMPASS_VERSION}), install it:\n  gem install compass"
	end
	exit false
rescue ::Exception => e
	$stderr.puts "#{e.class}: #{e}\n#{e.backtrace.join("\n")}"
	exit false
end


# Require any additional compass plugins here.

# NOTE: En compass-1.0.0.alpha.17 ya hay soporte de flexbox así que no hace falta
# usar esta librería.
# https://github.com/timhettler/compass-flexbox
#require "compass-flexbox"


# Set this to the root of your project when deployed:
http_path = "/"  # TODO: MIERDA
css_dir = "web/css"
sass_dir = "src/scss"
images_dir = "src/images"
# javascripts_dir = "src/js"


# You can select your preferred output style here (can be overridden via the command line):
# output_style = :expanded or :nested or :compact or :compressed

# To enable relative paths to assets via compass helper functions. Uncomment:
# relative_assets = true

# To disable debugging comments that display the original location of your selectors. Uncomment:
# line_comments = false


# If you prefer the indented syntax, you might want to regenerate this
# project again passing --syntax sass, or you can uncomment this:
# preferred_syntax = :sass
# and then run:
# sass-convert -R --from scss --to sass sass scss && rm -rf sass && mv scss sass
