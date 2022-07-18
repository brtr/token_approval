require("ethers");
import ERC20Artifact from '@openzeppelin/contracts/build/contracts/ERC20.json';
import ERC721MetadataArtifact from '@openzeppelin/contracts/build/contracts/ERC721.json';
const ERC20 = ERC20Artifact.abi;
const ERC721Metadata = ERC721MetadataArtifact.abi;
let loginAddress = localStorage.getItem("loginAddress");
let tokenType = $(".tokenType").val() || "token";
let chain_id = 1;
let chain_name = "ETH"
const metaProvider = new ethers.providers.Web3Provider(web3.currentProvider);
const signer = metaProvider.getSigner()
const whiteList = NODE_ENV["WHITELIST"].split(",");

let records, contract, allowance, isApproved, provider, block, time;

async function login() {
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    if (accounts.length > 0) {
        localStorage.setItem("loginAddress", accounts[0]);
        loginAddress = accounts[0];
    } else {
        localStorage.removeItem("loginAddress");
        loginAddress = null;
    }

    checkLogin();
}

function toggleAddress() {
    if(loginAddress) {
        $(".loginBtns .meta_dropdown").removeClass("hide");
        $("#login_address").text(loginAddress);
        $(".loginBtns .btns").addClass("hide");
    } else {
        $(".loginBtns .meta_dropdown").addClass("hide");
        $(".loginBtns .btns").removeClass("hide");
    }
}

function checkLogin() {
    toggleAddress();
}

function getData() {
    $.each(JSON.parse(records), async function(_idx, record) {
        let token = record.token_address
        let user = $("#address").val()
        let spender = record.contract_address
        let $tr = $(".tx[data-tx='" + record.txid + "']")
        block = await provider.getBlock(record.block_number)
        time = moment.unix(block.timestamp).format("YYYY-MM-DD HH:mm")

        if (record.is_erc20) {
            contract = new ethers.Contract(token, ERC20, provider);
            allowance = await contract.allowance(user, spender);
            allowance = parseFloat(ethers.utils.formatEther(allowance))

            if (allowance > 1 && tokenType == "token") {
                console.log("allowance is " + allowance);
                const text = allowance > 100000000 ? "Unlimited" : allowance;
                $tr.find(".allowance").text(text);
                $tr.find(".date").text(time);
                getName(token, "token");
                getName(spender, "spender");
            } else {
                $tr.remove();
                rebuildCard();
            }

        } else {
            contract = new ethers.Contract(token, ERC721Metadata, provider);
            isApproved = await contract.isApprovedForAll(user, spender);
            if (isApproved && tokenType == "nft") {
                $tr.find(".allowance").text("Unlimited");
                $tr.find(".date").text(time);
                getName(token, "token");
                getName(spender, "spender");
            } else {
                $tr.remove();
                rebuildCard();
            }
        }

        const isWhiteList = whiteList.some(e => {
            return e.toLowerCase() == spender.toLowerCase();
        })

        if (isWhiteList) {
            const $card = $tr.parents(".card")
            $card.find(".dangerLevel").html("<span class='text-success'>Low</span>");
            $card.appendTo($(".txs"));
        } else {
            $tr.parents(".card").find(".dangerLevel").html("<span class='text-danger'>High</span>");
        }

        $("#spinner").addClass("hide");
    })
}

function rebuildCard() {
    $(".card").each(function(_i, el) {
        if($(el).find(".tx").length == 0) {
            $(el).remove();
        };
    })
}

async function revoke($el, multiple=false, isLast=false) {
    if (loginAddress) {
        const { chainId } = await metaProvider.getNetwork();
        if (chain_id == chainId) {
            let user = $("#address").val()
            if (user.toUpperCase() == loginAddress.toUpperCase()) {
                let token = $el.data("token")
                let spender = $el.data("contract")
                if ($el.data("is-erc20")) {
                    contract = new ethers.Contract(token, ERC20, provider);
                    contract.connect(signer).approve(spender, 0)
                    .then(async (tx) => {
                        console.log("tx: ", tx)
                        await tx.wait();
                        if (!multiple || isLast) {
                            alert("Revoke successfully!");
                            reloadData(user);
                        }
                    }).catch (err => {
                        fetchErrMsg(err);
                        if (!multiple || isLast) {
                            reloadData(user);
                        }
                    })
                } else {
                    contract = new ethers.Contract(token, ERC721Metadata, provider);
                    contract.connect(signer).setApprovalForAll(spender, 0)
                    .then(async (tx) => {
                        console.log("tx: ", tx)
                        await tx.wait();
                        if (!multiple || isLast) {
                            alert("Revoke successfully!");
                            reloadData(user);
                        }
                    }).catch (err => {
                        fetchErrMsg(err);
                        if (!multiple || isLast) {
                            reloadData(user);
                        }
                    })
                }
            } else {
                if (!multiple || isLast) {
                    alert("You are not allowed to revoke other's token");
                    $("#spinner").addClass("hide");
                }
            }
        } else {
            if (!multiple || isLast) {
                alert("Please switch to " + chain_name + " to revoke token");
                $("#spinner").addClass("hide");
            }
        }
    } else {
        if (!multiple || isLast) {
            alert("Please login to revoke token");
            $("#spinner").addClass("hide");
        }
    }
}

function reloadData(address) {
    if (address.length > 0) {
        $.get("/get_tokens?address=" + address + "&chain_id=" + chain_id, function(data) {
            if(data.no_records) {
                alert("There is no record on this address");
                $(".txs").html('');
                $("#spinner").addClass("hide");
            } else {
                $(".txs").html(data);
                records = $("#records").val();
                getData();
            }
        })
    }
}

function getProvider() {
    const rpc_url = NODE_ENV[`${chain_name.toUpperCase()}_RPC_URL`]
    provider = new ethers.providers.JsonRpcProvider(rpc_url);
}

function getName(address, addressType) {
    if (address.length > 0) {
        $.get("/get_name?address=" + address + "&chain_id=" + chain_id, function(data) {
            const name = data.name;
            console.log("name: " + name);
            if(name.length > 0) {
                if(addressType == "token") {
                    $(".tx[data-address='" + address + "'] .token").text(name);
                } else {
                    $(".card[data-address='" + address + "'] .spender").text(name);
                }
            }
        })
    }
}

function fetchErrMsg (err) {
    const errMsg = err.error ? err.error.message : err.message;
    console.log("errMsg", errMsg);
    alert('Error:  ' + errMsg.split(/:(.*)/s)[1]);
    $("#spinner").hide();
}

$(document).on('turbolinks:load', function() {
    'use strict';
    $(async function() {
        $('[data-bs-toggle="tooltip"]').tooltip({html: true});
        $('.select2-dropdown').select2();

        if ($(".token-approval-checker-page").length > 0) {
            getProvider();

            $(".nav-link[data-chain-id=" + chain_id + "]").addClass("active");

            $(".token-approval-checker-page").on("click", ".tx", function() {
                var contract = $(this).data("contract");
                $(".collapse-" + contract).collapse('toggle');
            })

            $("#submitBtn").on("click", function(e) {
                e.preventDefault();
                $("#spinner").removeClass("hide");
                reloadData($("#address").val());
            })

            $(".token-approval-checker-page").on("click", "#revokeBtn", function(e){
                e.preventDefault();
                $("#spinner").removeClass("hide");
                revoke($(this))
            })

            $(".tokenType").on("change", function(){
                tokenType = $(this).val();
                reloadData($("#address").val());
            })

            $("#chainSelect").on("change", function(){
                chain_id = $(this).val();
                chain_name = $(this).find("option:selected").text();
                getProvider();
                reloadData($("#address").val());
            })

            $(".token-approval-checker-page").on("click", "#revokeAllBtn", function(e){
                e.preventDefault();
                $("#spinner").removeClass("hide");
                const $btns = $(".card[data-address='" + $(this).data("contract") + "'] #revokeBtn")
                $btns.each(function(idx, el) {
                    const isLast = $btns.length == idx + 1
                    revoke($(el), true, isLast);
                })
            })
        }

        if (window.ethereum) {
            checkLogin();

            ethereum.on('accountsChanged', function (accounts) {
                console.log('accountsChanges',accounts);
                if (accounts.length > 0) {
                    localStorage.setItem("loginAddress", accounts[0]);
                    loginAddress = accounts[0];
                } else {
                    localStorage.removeItem("loginAddress");
                    loginAddress = null;
                }
                toggleAddress();
            });

        // detect Network account change
            ethereum.on('chainChanged', function(networkId){
                console.log('networkChanged',networkId);
            });
        }

        $("#btn-login").on("click", function(){
            login();
        });
    });
})
