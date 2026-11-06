# frozen_string_literal: true

RecordingStudioRootSwitchable.configure do |config|
  config.current_actor_resolver = lambda do |controller:|
    Current.actor || controller.current_user
  end

  # Follow the host default layout. A Symbol method name raises on Root Switchable 0.11.
  config.layout = lambda { |controller:|
    "application" if controller.devise_controller?
  }

  config.after_switch_redirect = lambda do |controller:, return_to:, **|
    candidate_path = return_to.presence
    candidate_path = controller.main_app.root_path if candidate_path.blank?

    if internal_route?(candidate_path)
      candidate_path
    else
      controller.main_app.root_path
    end
  end

  config.scope :all_workspaces do |scope|
    scope.label = "All workspaces"
    scope.description = "Workspaces you can open in the dummy app."
    scope.switchable_root_types = [ "Workspace" ]
    scope.available_roots = lambda do |actor:, **|
      RecordingStudioAccessible.root_recordings_for(actor: actor, minimum_role: :view)
    end

    scope.default_root = lambda do |roots:, **|
      roots.first
    end
  end
end

def internal_route?(path)
  routes = [
    Rails.application.routes,
    RecordingStudioRootSwitchable::Engine.routes
  ]

  routes.any? do |route_set|
    route_set.recognize_path(path, method: :get)
    true
  rescue StandardError
    false
  end
end
