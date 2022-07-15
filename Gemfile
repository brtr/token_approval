source 'https://rubygems.org'
git_source(:github) { |repo| "https://github.com/#{repo}.git" }

ruby '3.0.1'

# Bundle edge Rails instead: gem 'rails', github: 'rails/rails', branch: 'main'
gem 'rails', '~> 6.1.3', '>= 6.1.3.1'
# Use postgresql as the database for Active Record
gem 'pg', '~> 1.1'
# Use Puma as the app server
gem 'puma', '~> 5.0'
# Use SCSS for stylesheets
gem 'sass-rails', '>= 6'
# Transpile app-like JavaScript. Read more: https://github.com/rails/webpacker
gem 'webpacker', '~> 5.0'
# Turbolinks makes navigating your web application faster. Read more: https://github.com/turbolinks/turbolinks
gem 'turbolinks', '~> 5'
# Build JSON APIs with ease. Read more: https://github.com/rails/jbuilder
# Use Redis adapter to run Action Cable in production
gem 'redis', '~> 4.5'
# hiredis
gem "hiredis"
# connection_pool
gem 'connection_pool'
# Use Active Model has_secure_password
# gem 'bcrypt', '~> 3.1.7'
gem 'figaro'
# Reduces boot times through caching; required in config/boot.rb
gem 'bootsnap', '>= 1.4.4', require: false
gem "sentry-raven"
gem 'sendgrid-actionmailer'
gem 'kaminari'
gem "chartkick"
gem 'money'
gem 'jquery-rails', '~> 4.4'
gem 'roo', '~> 2.8', '>= 2.8.3'

source "https://gems.contribsys.com/" do
  gem "sidekiq-pro", '5.2.2'
end

gem "sidekiq-scheduler", '~> 3.1.0'
gem 'slack-ruby-bot-server-events'
gem 'rest-client'
gem 'eth'

group :development, :test do
  # Call 'byebug' anywhere in the code to stop execution and get a debugger console
  gem 'byebug', platforms: [:mri, :mingw, :x64_mingw]
  gem 'rspec-rails', '~> 5.0', '>= 5.0.2'
  gem "factory_bot_rails", '~> 6.2.0'
  gem 'shoulda-matchers', '~> 5.0'
  gem 'rails-controller-testing'
  gem 'faker', :git => 'https://github.com/faker-ruby/faker.git', :branch => 'master'
  gem 'rexml', '~> 3.2.5'
  gem 'pry-rails'
end

group :development do
  # Access an interactive console on exception pages or by calling 'console' anywhere in the code.
  gem 'web-console', '>= 4.1.0'
  # Display performance information such as SQL time and flame graphs for each request in your browser.
  # Can be configured to work on production as well see: https://github.com/MiniProfiler/rack-mini-profiler/blob/master/README.md
  gem 'rack-mini-profiler', '~> 2.0'
  gem "capistrano", "~> 3.16", require: false
  gem 'capistrano-bundler'
  gem 'capistrano-rbenv'
  gem 'capistrano-rails'
  gem 'capistrano-sidekiq'
end

group :test do
  # Adds support for Capybara system testing and selenium driver
  gem 'capybara', '>= 3.26'
  gem 'selenium-webdriver'
  # Easy installation and use of web drivers to run system tests with browsers
  gem 'webdrivers'
  gem 'cucumber-rails', '~> 2.4', require: false
  gem 'simplecov', '~> 0.21.2'
  gem 'database_rewinder'
  gem 'capybara-select-2', '~> 0.5.1'
  gem 'webmock'
end

# Windows does not include zoneinfo files, so bundle the tzinfo-data gem
gem 'tzinfo-data', platforms: [:mingw, :mswin, :x64_mingw, :jruby]
