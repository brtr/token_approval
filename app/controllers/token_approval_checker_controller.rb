class TokenApprovalCheckerController < ApplicationController
  def index
  end

  def get_tokens
    chain_id = params[:chain_id].to_i || 1
    data = TokenApprovalCheckerService.get_txs(params[:address], chain_id) rescue []
    if data.any?
      @txs = data.group_by{|tx| tx["contract_address"]}

      render partial: "table"
    else
      render json: {no_records: true}
    end
  end

  def get_name
    chain_id = params[:chain_id].to_i || 1
    name = TokenApprovalCheckerService.get_name(params[:address], chain_id)

    render json: {name: name}
  end
end
