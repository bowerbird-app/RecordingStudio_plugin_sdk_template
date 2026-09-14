# frozen_string_literal: true

require "test_helper"

class ConfigurationTest < Minitest::Test
  def setup
    @configuration = RecordingStudioPluginSdkTemplate::Configuration.new
  end

  def test_merge_ignores_unknown_keys
    @configuration.merge!(unknown_key: "ignored", api_key: "nope")

    refute_respond_to @configuration, :unknown_key
    refute_respond_to @configuration, :api_key
    refute_respond_to @configuration, :enable_feature_x
    refute_respond_to @configuration, :timeout
  end

  def test_merge_with_non_enumerable_is_noop
    original = @configuration.to_h

    @configuration.merge!(nil)

    assert_equal original, @configuration.to_h
  end

  def test_initialize_keeps_hooks_and_no_placeholder_attrs
    configuration = RecordingStudioPluginSdkTemplate::Configuration.new

    assert_instance_of RecordingStudio::Hooks, configuration.hooks
    refute_respond_to configuration, :api_key
    refute_respond_to configuration, :enable_feature_x
    refute_respond_to configuration, :timeout
  end

  def test_to_h_reports_registered_hook_counts
    @configuration.hooks.before_initialize { nil }
    @configuration.hooks.before_initialize { nil }
    @configuration.hooks.after_service { nil }

    result = @configuration.to_h

    assert_equal 2, result.fetch(:hooks_registered).fetch(:before_initialize)
    assert_equal 1, result.fetch(:hooks_registered).fetch(:after_service)
    refute result.key?(:api_key)
    refute result.key?(:enable_feature_x)
    refute result.key?(:timeout)
  end

  def test_configure_without_block_is_safe
    RecordingStudioPluginSdkTemplate.configure

    assert_kind_of RecordingStudioPluginSdkTemplate::Configuration, RecordingStudioPluginSdkTemplate.configuration
  end
end
