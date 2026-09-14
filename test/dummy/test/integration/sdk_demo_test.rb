# frozen_string_literal: true

require "test_helper"
require "devise/test/integration_helpers"

class SdkDemoTest < ActionDispatch::IntegrationTest
  include Devise::Test::IntegrationHelpers

  setup do
    @user = User.find_or_create_by!(email: "sdk-demo-test@example.com") do |record|
      record.password = "Password123!"
      record.password_confirmation = "Password123!"
    end
    sign_in @user
  end

  test "home serves sdk assets and mounts the ready fixture host" do
    get root_path
    assert_response :success
    assert_match(%r{/sdk/recording-studio-plugin-sdk\.css}, response.body)
    assert_match(%r{/sdk/recording-studio-plugin-sdk\.js}, response.body)
    assert_select "[data-sdk-demo-host].rs-widget"
    assert_select "[data-sdk-fixture=v1-ready]"
    assert_select "[data-sdk-fixture=v1-empty]"
    assert_select "[data-sdk-fixture=v1-error]"
    assert_select "[data-sdk-fixture=v1-incompatible]"
    assert_select "[data-sdk-action=destroy]"
  end

  test "fixture payloads are schema_version 1 shaped" do
    get "/sdk-fixtures/v1-ready.json"
    assert_response :success
    payload = JSON.parse(response.body)
    assert_equal 1, payload["schema_version"]
    assert payload["html"].is_a?(String)
    assert payload["configuration"].is_a?(Hash)
    assert payload.dig("sdk", "minimum_version").is_a?(String)
  end

  test "compiled sdk assets are present" do
    get "/sdk/recording-studio-plugin-sdk.js"
    assert_response :success
    assert_match("RecordingStudioPluginSdk", response.body)

    get "/sdk/recording-studio-plugin-sdk.css"
    assert_response :success
    assert_match(".rs-widget", response.body)
  end
end
