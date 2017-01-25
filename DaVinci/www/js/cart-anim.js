/* code for  animate the cart items */
var cartAnimation = null; 
$(function(){

	/* $(document).on('click', '.add-cart', function(ev){
		var imgtodrag=$(this).parents('ion-item').find("img");
		cartAnimation(imgtodrag);
	})*/

	cartAnimation = function(imgtodrag) {
		if (imgtodrag) {
			var imgclone = imgtodrag.clone()
				.offset({
				top: imgtodrag.offset().top,
					left: imgtodrag.offset().left
				})
				.css({
					'opacity': '0.7',
					'position': 'absolute',
					'height': '150px',
					'width': '150px',
					'z-index': '9999'
				})
				.appendTo($('body'))
				.animate({
					'top': 10,
					'left': $('body').width() - 80,
					'width': 50,
					'height': 50
				}, 1000, 'easeInOutExpo');

			imgclone
				.animate({
					'width': 0,
					'height': 0
				}, function () {
					$(this).detach()
				});
		}
	}
})
