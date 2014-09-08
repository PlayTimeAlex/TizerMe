var $tizerContainer, tizerContainerW, tizerCount, tizerWidth, $tizers;

(function($) {
    $(document).ready(function(){
        var addtext = "Добавить в проект", deltext = "Убрать из проекта";

        $('.b-tizer').on({
            mouseenter: function (e) {
                if(e.ctrlKey === false && e.metaKey === false) {
                    $('.b-tizer__hover', this).css('display', 'block').stop().animate({
                        opacity: 1
                    }, 300);
                }

            },
            mouseleave: function () {
                $('.b-tizer__hover', this).stop().animate({
                    opacity:0
                }, 300, function(){
                    $(this).css('display', 'none')
                });
            }
        });

        $('.b-tizer').on('click', function(e){
            if(e.ctrlKey === true || e.metaKey === true) {
                var $tizer = $(this);
                if($tizer.hasClass("selected")){
                    $tizer.removeClass('selected');
                    $('.b-tizer__addbtn', this).html(addtext);
                } else {
                    $tizer.addClass('selected');
                    $('.b-tizer__addbtn', this).html(deltext);
                }
                return false;
            }
        });

        $('.b-tizer__addbtn').on('click', function(){
            var $tizer = $(this).closest('.b-tizer');
            if($tizer.hasClass("selected")){
                $tizer.removeClass('selected');
                $(this).html(addtext);
            } else {
                $tizer.addClass('selected');
                $(this).html(deltext);
            }
            return false;
        });

        $tizerContainer = $('#tizer-container');
        tizerContainerW = $tizerContainer.outerWidth(true);
        tizerWidth = parseInt($(".b-tizer").css('minWidth'));
        tizerCount = Math.floor(tizerContainerW/tizerWidth);
        $tizers = $('.b-tizer');

        $tizers.outerWidth(100/Math.floor(tizerCount)+"%");

        $(window).resize(function(){
            //remove details when resize window
            $('.b-tdetalis').stop().slideUp('fast', function(){
                $(this).remove();
            });

            tizerContainerW = $tizerContainer.outerWidth(true);
            tizerCount = Math.floor(tizerContainerW/tizerWidth);
            $tizers.outerWidth(100/tizerCount+"%");

            console.log(tizerCount);
        });

        //temporary
        var detalis = $('.b-tdetalis');
        $('.b-tdetalis').remove();
        $('.b-tizer__detalisbtn').on('click', function(){
            //$('.b-tdetalis').stop().slideDown('fast');
            var parent = $(this);
            if($(this).hasClass('open')){
                $('.b-tdetalis').stop().slideUp('fast', function(){
                    $(this).remove();
                });
                $(this).removeClass('open');
            } else {
                $('.b-tdetalis').stop().slideUp('fast', function(){
                    $(this).remove();
                });
                var afterEl = ".b-tizer:eq("+(tizerCount-1)+")"; //нужно определять текущий ряд. В данный момент коректно работает только в первом ряду.

                detalis.insertAfter(afterEl).stop().slideDown('fast');
                console.log(afterEl);
                parent.addClass('open');
            }


            return false;
        });
    });

    $(window).load(function() {
         
    });
}(jQuery));