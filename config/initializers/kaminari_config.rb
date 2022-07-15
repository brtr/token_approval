# frozen_string_literal: true

Kaminari.configure do |config|
  config.default_per_page = 100
  config.window = 1
  config.left = 2
  config.right = 1
end
