#!/usr/bin/env puma

application = "token_approval"

app_path = "/home/deploy/app/#{application}"
shared_path = "#{app_path}/shared"
current_path = "#{app_path}/current"

directory "#{current_path}"
rackup "#{current_path}/config.ru"
environment 'production'
pidfile "#{shared_path}/tmp/pids/puma.pid"
state_path "#{shared_path}/tmp/pids/puma.state"
stdout_redirect "#{shared_path}/log/puma_access.log", "#{shared_path}/log/puma_error.log", true

threads_count = ENV.fetch('RAILS_MAX_THREADS') { 5 }
threads threads_count, threads_count
workers 2
port 8080

worker_timeout 90

preload_app!

on_restart do
  puts 'Refreshing Gemfile'
  ENV["BUNDLE_GEMFILE"] = "#{current_path}/Gemfile"
end

on_worker_boot do
  ActiveSupport.on_load(:active_record) do
    ActiveRecord::Base.establish_connection
  end
end

before_fork do
  require 'puma_worker_killer'
  PumaWorkerKiller.config do |config|
    config.ram           = 2048 # mb
    config.frequency     = 5    # seconds
    config.percent_usage = 0.80
    config.rolling_restart_frequency = 6 * 3600 # 6 hours in seconds
    config.reaper_status_logs = true # setting this to false will not log lines like:
  end
  PumaWorkerKiller.start
  ActiveRecord::Base.connection_pool.disconnect!
end

