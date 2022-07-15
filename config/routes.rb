require "sidekiq/pro/web"
require 'sidekiq-scheduler/web'

Rails.application.routes.draw do
  root 'token_approval_checker#index'
  mount Sidekiq::Web => "/sidekiq"
  # For details on the DSL available within this file, see https://guides.rubyonrails.org/routing.html

  match "/400", to: "errors#invalid_params", via: :all
  match "/522", to: "errors#internal_server_error", via: :all
  match "/404", to: "errors#not_found", via: :all
  match "/500", to: "errors#internal_server_error", via: :all

  resources :token_approval_checker, only: :index

  get "/get_tokens" => "token_approval_checker#get_tokens", as: :get_tokens
  get "/get_name" => "token_approval_checker#get_name", as: :get_name
end
