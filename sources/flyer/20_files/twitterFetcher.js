!function(e,t){"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?module.exports=t():t()}(this,function(){function e(e){if(null===w){for(var t=e.length,i=0,s=document.getElementById(a),n="<ul>";t>i;)n+='<li class="clearfix">'+e[i]+"</li>",i++;n+="</ul>",s.innerHTML=n}else w(e)}function t(e){return e.replace(/<b[^>]*>(.*?)<\/b>/gi,function(e,t){return t}).replace(/class=".*?"|data-query-source=".*?"|dir=".*?"|rel=".*?"/gi,"")}function i(e){for(var t=e.getElementsByTagName("a"),i=t.length-1;i>=0;i--)t[i].setAttribute("target","_blank")}function s(e,t){for(var i=[],s=new RegExp("(^| )"+t+"( |$)"),n=e.getElementsByTagName("*"),a=0,l=n.length;l>a;a++)s.test(n[a].className)&&i.push(n[a]);return i}function n(e){if(void 0!==e){var t=e.innerHTML.match(/data-srcset="([A-z0-9%_\.-]+)/i)[0];return decodeURIComponent(t).split('"')[1]}}var a="",l=20,r=!0,o=[],c=!1,d=!0,p=!0,m=null,u=!0,h=!0,w=null,g=!0,f=!1,v=!0,b="en",y=!0,k=null,T={fetch:function(e){if(void 0===e.maxTweets&&(e.maxTweets=20),void 0===e.enableLinks&&(e.enableLinks=!0),void 0===e.showUser&&(e.showUser=!0),void 0===e.showTime&&(e.showTime=!0),void 0===e.dateFunction&&(e.dateFunction="default"),void 0===e.showRetweet&&(e.showRetweet=!0),void 0===e.customCallback&&(e.customCallback=null),void 0===e.showInteraction&&(e.showInteraction=!0),void 0===e.showImages&&(e.showImages=!1),void 0===e.linksInNewWindow&&(e.linksInNewWindow=!0),void 0===e.showPermalinks&&(e.showPermalinks=!0),c)o.push(e);else{c=!0,a=e.domId,l=e.maxTweets,r=e.enableLinks,p=e.showUser,d=e.showTime,h=e.showRetweet,m=e.dateFunction,w=e.customCallback,g=e.showInteraction,f=e.showImages,v=e.linksInNewWindow,y=e.showPermalinks;var t=document.getElementsByTagName("head")[0];null!==k&&t.removeChild(k),k=document.createElement("script"),k.type="text/javascript",k.src="https://cdn.syndication.twimg.com/widgets/timelines/"+e.id+"?&lang="+(e.lang||b)+"&callback=twitterFetcher.callback&suppress_response_codes=true&rnd="+Math.random(),t.appendChild(k)}},callback:function(a){var w=document.createElement("div");w.innerHTML=a.body,"undefined"==typeof w.getElementsByClassName&&(u=!1);var b=[],k=[],x=[],C=[],E=[],N=[],_=[],B=0;if(u)for(var I=w.getElementsByClassName("tweet");B<I.length;)E.push(I[B].getElementsByClassName("retweet-credit").length>0?!0:!1),(!E[B]||E[B]&&h)&&(b.push(I[B].getElementsByClassName("e-entry-title")[0]),N.push(I[B].getAttribute("data-tweet-id")),k.push(I[B].getElementsByClassName("p-author")[0]),x.push(I[B].getElementsByClassName("dt-updated")[0]),_.push(I[B].getElementsByClassName("permalink")[0]),C.push(void 0!==I[B].getElementsByClassName("inline-media")[0]?I[B].getElementsByClassName("inline-media")[0]:void 0)),B++;else for(var I=s(w,"tweet");B<I.length;)b.push(s(I[B],"e-entry-title")[0]),N.push(I[B].getAttribute("data-tweet-id")),k.push(s(I[B],"p-author")[0]),x.push(s(I[B],"dt-updated")[0]),_.push(s(I[B],"permalink")[0]),C.push(void 0!==s(I[B],"inline-media")[0]?s(I[B],"inline-media")[0]:void 0),E.push(s(I[B],"retweet-credit").length>0?!0:!1),B++;b.length>l&&(b.splice(l,b.length-l),k.splice(l,k.length-l),x.splice(l,x.length-l),E.splice(l,E.length-l),C.splice(l,C.length-l),_.splice(l,_.length-l));for(var A=[],B=b.length,L=0;B>L;){if("string"!=typeof m){var P=x[L].getAttribute("datetime"),R=new Date(x[L].getAttribute("datetime").replace(/-/g,"/").replace("T"," ").split("+")[0]),F=m(R,P);if(x[L].setAttribute("aria-label",F),b[L].innerText)if(u)x[L].innerText=F;else{var M=document.createElement("p"),H=document.createTextNode(F);M.appendChild(H),M.setAttribute("aria-label",F),x[L]=M}else x[L].textContent=F}var U="";r?(v&&(i(b[L]),p&&i(k[L])),p&&(U+='<div class="user">'+t(k[L].innerHTML)+"</div>"),f&&void 0!==C[L]&&(U+='<div class="twitter-img"><img class="img-responsive" src="'+n(C[L])+'" alt="Image from tweet" /></div>'),U+='<p class="tweet clearfix">'+t(b[L].innerHTML)+"</p>",d&&(U+=y?'<p class="timePosted pull-right"><a href="'+_[L]+'"><i class="fa fa-clock-o"></i>&nbsp;'+x[L].getAttribute("aria-label")+"</a></p>":'<p class="timePosted">'+x[L].getAttribute("aria-label")+"</p>")):b[L].innerText?(p&&(U+='<p class="user">'+k[L].innerText+"</p>"),U+='<p class="tweet">'+b[L].innerText+"</p>",d&&(U+='<p class="timePosted">'+x[L].innerText+"</p>")):(p&&(U+='<p class="user">'+k[L].textContent+"</p>"),U+='<p class="tweet">'+b[L].textContent+"</p>",d&&(U+='<p class="timePosted">'+x[L].textContent+"</p>")),g&&(U+='<p class="interact pull-left"><a title="Reply" href="https://twitter.com/intent/tweet?in_reply_to='+N[L]+'" class="twitter_reply_icon"'+(v?' target="_blank">':">")+'<i class="fa fa-mail-forward"></i></a><a title="Retweet" href="https://twitter.com/intent/retweet?tweet_id='+N[L]+'" class="twitter_retweet_icon"'+(v?' target="_blank">':">")+'<i class="fa fa-retweet"></i></a><a title="Favorite" href="https://twitter.com/intent/favorite?tweet_id='+N[L]+'" class="twitter_fav_icon"'+(v?' target="_blank">':">")+'<i class="fa fa-star"></i></a></p>'),A.push(U),L++}e(A),c=!1,o.length>0&&(T.fetch(o[0]),o.splice(0,1))}};return window.twitterFetcher=T,T});