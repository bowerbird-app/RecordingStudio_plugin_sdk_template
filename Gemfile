# frozen_string_literal: true

source "https://rubygems.org"

# Specify your gem's dependencies in recording_studio_plugin_sdk_template.gemspec
gemspec

# recording_studio is not published to RubyGems; resolve the gemspec pin from GitHub.
# flat_pack is GitHub-only; Recording Studio 6.5 requires it (>= 0.1.315).
gem "flat_pack", github: "bowerbird-app/flatpack", tag: "v0.1.341"
gem "recording_studio", github: "bowerbird-app/RecordingStudio", tag: "v6.5.0"

gem "devise"
gem "puma"
gem "sprockets-rails"

group :development, :test do
  gem "debug"
  gem "simplecov", require: false
end

group :development do
  gem "rubocop", require: false
  gem "rubocop-rails", require: false
end
