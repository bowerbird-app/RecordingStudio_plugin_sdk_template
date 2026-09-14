# frozen_string_literal: true

require "recording_studio"
require "recording_studio_plugin_sdk_template/version"
require "recording_studio_plugin_sdk_template/engine"
require "recording_studio_plugin_sdk_template/configuration"

module RecordingStudioPluginSdkTemplate
  class << self
    def configuration
      @configuration ||= Configuration.new
    end

    def configure
      yield(configuration) if block_given?
    end
  end
end
