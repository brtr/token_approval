require 'open-uri'
require 'eth'

class TokenApprovalCheckerService
  class << self
    CHAINS = {
      1 => {
        name: "eth",
        url: "https://etherscan.io/",
        api_url: "https://api.etherscan.io",
        api_key: ENV["ETH_API_KEY"]
      },
      56 => {
        name: "bsc",
        url: "https://bscscan.com/",
        api_url: "https://api.bscscan.com",
        api_key: ENV["BSC_API_KEY"]
      },
      137 => {
        name: "matic",
        url: "https://polygonscan.com/",
        api_url: "https://api.polygonscan.com",
        api_key: ENV["MATIC_API_KEY"]
      },
      250 => {
        name: "ftm",
        url: "https://ftmscan.com/",
        api_url: "https://api.ftmscan.com",
        api_key: ENV["FTM_API_KEY"]
      },
      10 => {
        name: "optimistic",
        url: "https://optimistic.etherscan.io/",
        api_url: "https://api-optimistic.etherscan.io/",
        api_key: ENV["OPTIMISTIC_API_KEY"]
      },
      128 => {
        name: "heco",
        url: "https://hecoinfo.com/",
        api_url: "https://api.hecoinfo.com/",
        api_key: ENV["HECO_API_KEY"]
      },
      42161 => {
        name: "arbitrum",
        url: "https://arbiscan.io/",
        api_url: "https://api.arbiscan.io",
        api_key: ENV["ARBITRUM_API_KEY"]
      },
      43114 => {
        name: "avax",
        url: "https://snowtrace.io/",
        api_url: "https://api.snowtrace.io/",
        api_key: ENV["AVAX_API_KEY"]
      }
    }
    @data = []

    def get_txs(user_address, chain_id)
      user_address = user_address.downcase
      chain = CHAINS[chain_id]
      @data = $redis.get("#{user_address}_#{chain_id}_approval_txs") || []
      if @data.blank?
        client = Eth::Client.create ENV["#{chain[:name].upcase}_RPC_URL"]
        approvalTxs = client.eth_get_logs({
          fromBlock: 0,
          toBlock: "latest",
          topics: ["0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925", hex_zero_pad(user_address, 32)]
        })["result"]

        get_data(approvalTxs, chain_id, true)
        approvalForAllTxs = client.eth_get_logs({
            fromBlock: 0,
            toBlock: "latest",
            topics: ["0x17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c31", hex_zero_pad(user_address, 32)]
        })["result"]

        get_data(approvalForAllTxs, chain_id, false)
        @data = @data.to_json
        $redis.set("#{user_address}_#{chain_id}_approval_txs", @data, ex: 30.minutes.to_i)
      end

      JSON.parse(@data)
    end

    def get_data(txs, chain_id, is_erc20)
      chain = CHAINS[chain_id]
      txs.each do |tx|
        puts "Sync tx : #{tx}"
        contract = hexStripZeros(tx["topics"][2])
        next if contract == "0x0000000000000000000000000000000000000000"
        tx = {
          token_address: tx["address"],
          token_link: "#{chain[:url]}address/#{tx["address"]}",
          contract_address: contract,
          contract_link: "#{chain[:url]}address/#{contract}",
          chain_name: chain[:name],
          chain_id: chain_id,
          is_erc20: is_erc20 && tx["topics"].size == 3,
          txid: tx["transactionHash"],
          tx_link: "#{chain[:url]}tx/#{tx["transactionHash"]}",
          block_number: tx["blockNumber"]
        }
        @data.push(tx) unless @data.find_index{|r| r[:token_address] == tx[:token_address] && r[:contract_address] == tx[:contract_address]}
      end
    end

    def get_name(address, chain_id)
      chain = CHAINS[chain_id]
      name = fetch_name_from_1inch(address, chain_id) rescue ""
      name = fetch_name_from_moralis(address, chain[:name]) rescue "" if name == "" 
      name = fetch_name_from_abi(address, chain) rescue "" if name == "" 
      name
    end

    def fetch_name_from_abi(address, chain)
      fetch_url = "#{chain[:api_url]}/api?module=contract&action=getsourcecode&address=#{address}&apikey=#{chain[:api_key]}"
      res = Net::HTTP.get_response(URI(fetch_url))
      if res.code.to_i == 200
        data = JSON.parse(res.body)
        data["result"][0]["ContractName"]
      end
    end

    def fetch_name_from_moralis(address, chain_name)
      erc20_url = "https://deep-index.moralis.io/api/v2/erc20/metadata?chain=#{chain_name}&addresses=#{address}"
      nft_url = "https://deep-index.moralis.io/api/v2/nft/#{address}/metadata?chain=#{chain_name}"
      [erc20_url, nft_url].each do |fetch_url|
        response = URI.open(fetch_url, {"X-API-Key" => ENV["MORALIS_API"]}).read
        if response
          data = JSON.parse(response)
          if data.is_a?(Array)
            return data.first["name"]
          else
            return data["name"]
          end
        end
      end
    end

    def fetch_name_from_1inch(address, chain_id)
      fetch_url = "https://tokens.1inch.io/v1.1/#{chain_id}"
      res = Net::HTTP.get_response(URI(fetch_url))
      if res.code.to_i == 200
        data = JSON.parse(res.body)
        r = data[address]
        "#{r['name']} - #{r['symbol']}" rescue ''
      end
    end

    private
    def hex_zero_pad(address, len)
      count = (2 * len + 2) - address.length
      return "0x" + "0" * count + address[2..-1]
    end

    def hexStripZeros(address)
      return "0x" + address[26..-1]
    end
  end
end