# frozen_string_literal: true

module RecordingStudioPluginSdkTemplate
  class Engine < ::Rails::Engine
    isolate_namespace RecordingStudioPluginSdkTemplate

    class << self
      def apply_model_extensions(target)
        apply_extensions(target, extensions_for(:model, extension_keys_for(target)))
      end

      def apply_controller_extensions(target)
        apply_extensions(target, extensions_for(:controller, extension_keys_for(target)))
      end

      def load_yaml_configuration(app)
        return unless app.respond_to?(:config_for)

        yaml = begin
          app.config_for(:recording_studio_plugin_sdk_template)
        rescue StandardError
          nil
        end
        RecordingStudioPluginSdkTemplate.configuration.merge!(yaml) if yaml.respond_to?(:each)
      rescue StandardError
        # ignore load errors; host app can provide initializer overrides
      end

      def load_x_configuration(app)
        xcfg = x_configuration_source(app)
        return unless xcfg

        hash = configuration_hash_for(xcfg)
        RecordingStudioPluginSdkTemplate.configuration.merge!(hash) if hash.any?
      rescue StandardError
        # ignore OrderedOptions conversion failures
      end

      private

      def x_configuration_source(app)
        return unless app.config.respond_to?(:x)
        return unless app.config.x.respond_to?(:recording_studio_plugin_sdk_template)

        app.config.x.recording_studio_plugin_sdk_template
      end

      def configuration_hash_for(config_source)
        return config_source.to_h if config_source.respond_to?(:to_h)

        hash = {}
        config_source.each_pair { |key, value| hash[key] = value } if config_source.respond_to?(:each_pair)
        hash
      end

      def extensions_for(kind, names)
        hooks = RecordingStudioPluginSdkTemplate.configuration.hooks
        Array(names).flat_map do |name|
          if kind == :model
            hooks.model_extensions_for(name)
          else
            hooks.controller_extensions_for(name)
          end
        end
      end

      def apply_extensions(target, extensions)
        return unless target

        key = :@recording_studio_plugin_sdk_template_applied_extensions
        applied = target.instance_variable_get(key) || identity_hash

        extensions.flatten.compact.each do |extension|
          next if applied[extension]

          target.class_eval(&extension)
          applied[extension] = true
        end

        target.instance_variable_set(key, applied)
      end

      def extension_keys_for(target)
        names = [target.name, target.name&.demodulize].compact.uniq
        names.map(&:to_sym)
      end

      def identity_hash
        {}.compare_by_identity
      end
    end

    # Run before_initialize hooks
    initializer "recording_studio_plugin_sdk_template.before_initialize",
                before: "recording_studio_plugin_sdk_template.load_config" do |_app|
      RecordingStudioPluginSdkTemplate.configuration.hooks.run(:before_initialize, self)
    end

    initializer "recording_studio_plugin_sdk_template.load_config" do |app|
      Engine.load_yaml_configuration(app)
      Engine.load_x_configuration(app)

      # Run on_configuration hooks after config is loaded
      RecordingStudioPluginSdkTemplate.configuration.hooks.run(
        :on_configuration,
        RecordingStudioPluginSdkTemplate.configuration
      )
    end

    # Run after_initialize hooks
    initializer "recording_studio_plugin_sdk_template.after_initialize",
                after: "recording_studio_plugin_sdk_template.load_config" do |_app|
      RecordingStudioPluginSdkTemplate.configuration.hooks.run(:after_initialize, self)
    end

    # Apply model extensions when models are loaded
    initializer "recording_studio_plugin_sdk_template.apply_model_extensions" do
      config.to_prepare do
        next unless defined?(ActiveRecord::Base)

        ActiveRecord::Base.descendants.each do |model|
          next if model.abstract_class?

          RecordingStudioPluginSdkTemplate::Engine.apply_model_extensions(model)
        end
      end
    end

    # Apply controller extensions
    initializer "recording_studio_plugin_sdk_template.apply_controller_extensions" do
      config.to_prepare do
        next unless defined?(ActionController::Base)

        ActionController::Base.descendants.each do |controller|
          RecordingStudioPluginSdkTemplate::Engine.apply_controller_extensions(controller)
        end
      end
    end
  end
end
