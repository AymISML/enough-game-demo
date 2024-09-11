The game will be hosted on Cloudflare Pages and served on an edge network to minimize latency across the globe, served through this link:
https://enough-wv.pages.dev/

An embedded demo can be view through this link:
https://aymisml.github.io/enough-game-demo/embed-example/

To replicate the iframe:
1. Add an empty iframe element with class "game-iframe"
<iframe class="game-iframe"></iframe>

2. Import the gameloader script in <head>
<script src="https://enough-wv.pages.dev/Scripts/wv-enough-gameloader-min.js"></script>

3. Call startGame and pass it the CTA smarturl and eventLogsCallback function when ready
<script>
   var eventLogsCallback = function(eventName, eventParam){
      // Log to analytics service
   }
   startGame(SMARTURL_HERE, eventLogsCallback);
</script>

Events published from game:
==============================
EVENT NAME		         PARAM
==============================
started			         N/A
pathway_selected	      pathway_country_name
stage_1_completed	      N/A
stage_2_completed	      N/A
stage_3_completed    	N/A
completed      		   N/A
cta_clicked		         N/A
facebook_share_clicked	N/A
twitter_share_clicked	N/A
native_share_clicked	   N/A