import React, { useState, useRef } from 'react';
import { View, ScrollView, Image, StyleSheet, Dimensions } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_HEIGHT = 280;

interface AnimalImageCarouselProps {
    images: string[];
}

export const AnimalImageCarousel: React.FC<AnimalImageCarouselProps> = ({ images }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const scrollRef = useRef<ScrollView>(null);

    const handleScroll = (event: any) => {
        const contentOffset = event.nativeEvent.contentOffset.x;
        const index = Math.round(contentOffset / SCREEN_WIDTH);
        if (index !== activeIndex) {
            setActiveIndex(index);
        }
    };

    if (images.length === 0) {
        return (
            <View style={styles.placeholder}>
                <View style={styles.placeholderContent} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView
                ref={scrollRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
            >
                {images.map((uri, index) => (
                    <Image
                        key={index}
                        source={{ uri }}
                        style={styles.image}
                        resizeMode="cover"
                    />
                ))}
            </ScrollView>

            {images.length > 1 && (
                <View style={styles.indicators}>
                    {images.map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.indicator,
                                index === activeIndex && styles.indicatorActive,
                            ]}
                        />
                    ))}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: IMAGE_HEIGHT,
        backgroundColor: colors.minimalist.bgLight,
    },
    image: {
        width: SCREEN_WIDTH,
        height: IMAGE_HEIGHT,
    },
    placeholder: {
        height: IMAGE_HEIGHT,
        backgroundColor: colors.minimalist.bgLight,
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderContent: {
        width: 100,
        height: 100,
        backgroundColor: colors.minimalist.border,
        borderRadius: 16,
    },
    indicators: {
        position: 'absolute',
        bottom: spacing.md,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
    },
    indicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
    },
    indicatorActive: {
        backgroundColor: colors.minimalist.white,
        width: 20,
    },
});
